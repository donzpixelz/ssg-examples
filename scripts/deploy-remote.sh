#!/usr/bin/env bash
# Actions runner: upload run.sh to S3, presign it, then call SSM via --cli-input-json.
set -Eeuo pipefail
: "${AWS_REGION:?}"; : "${INSTANCE_ID:?}"; : "${ARTIFACT_URL:?}"
REMOTE_ROOT="${REMOTE_ROOT:-/usr/share/nginx/html}"

echo "[1/5] Create the remote script (run.sh)"
cat > run.sh <<'EOS'
#!/usr/bin/env bash
set -Eeuo pipefail
trap '' PIPE
set +o pipefail

ARTIFACT_URL="${1:?artifact url missing}"
REMOTE_ROOT="${2:-/usr/share/nginx/html}"

echo "[A/4] Ensure tools"
for p in curl tar; do
  command -v "$p" >/dev/null 2>&1 || {
    if command -v yum >/dev/null 2>&1; then sudo yum -y install "$p" >/dev/null || true
    elif command -v dnf >/dev/null 2>&1; then sudo dnf -y install "$p" >/dev/null || true
    elif command -v apt-get >/dev/null 2>&1; then sudo apt-get update -y >/dev/null && sudo apt-get install -y "$p" >/dev/null || true
    fi
  }
done

echo "[B/4] Single default vhost -> $REMOTE_ROOT"
sudo mkdir -p /etc/nginx/conf.d "$REMOTE_ROOT"
sudo tee /etc/nginx/conf.d/default.conf >/dev/null <<NGINX
server {
  listen 80 default_server;
  listen [::]:80 default_server;
  server_name _;
  root $REMOTE_ROOT;
  index index.html;
  location / { try_files \$uri \$uri/ /index.html; }
}
NGINX

echo "[C/4] Download & deploy artifact"
TMP="/tmp/site.tgz"
curl -fsSL --retry 3 --connect-timeout 10 "$ARTIFACT_URL" -o "$TMP"
STAGE="$(mktemp -d)"
tar -xzf "$TMP" -C "$STAGE"
if [ "$(find "$STAGE" -mindepth 1 -maxdepth 1 -type d | wc -l | tr -d ' ')" = "1" ] && [ ! -f "$STAGE/index.html" ]; then
  INNER="$(find "$STAGE" -mindepth 1 -maxdepth 1 -type d | head -n1)"; STAGE="$INNER"
fi
sudo rm -rf "$REMOTE_ROOT"/*
sudo cp -a "$STAGE"/. "$REMOTE_ROOT"/
id nginx >/dev/null 2>&1 && sudo chown -R nginx:nginx "$REMOTE_ROOT" || true
sudo find "$REMOTE_ROOT" -type d -exec chmod 755 {} \; || true
sudo find "$REMOTE_ROOT" -type f -exec chmod 644 {} \; || true

echo "[D/4] Reload nginx + proof"
sudo nginx -t
sudo systemctl enable --now nginx
sudo systemctl restart nginx
OUT="/tmp/curl_localhost.html"
curl -fsS -H "Cache-Control: no-cache" --max-time 10 http://127.0.0.1/ -o "$OUT" || true
echo "--- LIST $REMOTE_ROOT ---"; sed -n '1,40p' < <(ls -la "$REMOTE_ROOT") || true
echo "--- CURL localhost (first 20 lines) ---"; sed -n '1,20p' "$OUT" || true
echo "=== done ==="
EOS
chmod +x run.sh

echo "[2/5] Upload run.sh to your artifacts bucket"
ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text)"
BUCKET="ssg-examples-artifacts-${ACCOUNT_ID}-${AWS_REGION}"
KEY_RUN="ssg-examples/scripts/run-${GITHUB_SHA}.sh"
if ! aws s3api head-bucket --bucket "$BUCKET" >/dev/null 2>&1; then
  aws s3api create-bucket --bucket "$BUCKET" --region "$AWS_REGION" --create-bucket-configuration LocationConstraint="$AWS_REGION"
  aws s3api put-bucket-versioning --bucket "$BUCKET" --versioning-configuration Status=Enabled
  aws s3api put-public-access-block --bucket "$BUCKET" --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
fi
aws s3 cp run.sh "s3://$BUCKET/$KEY_RUN" --content-type text/x-shellscript

echo "[3/5] Presign both URLs"
RUN_URL="$(aws s3 presign "s3://$BUCKET/$KEY_RUN" --expires-in 3600)"
ART_URL="${ARTIFACT_URL}"

echo "[4/5] SSM via --cli-input-json (robust quoting)"
# Ensure jq exists (GitHub ubuntu-latest usually has it; install if missing)
if ! command -v jq >/dev/null 2>&1; then
  sudo apt-get update -y >/dev/null 2>&1 || true
  sudo apt-get install -y jq >/dev/null 2>&1 || true
fi

# Build the exact command we want to run on the instance
REMOTE_CMD="curl -fsSL \"${RUN_URL}\" -o /tmp/run.sh && sudo bash /tmp/run.sh \"${ART_URL}\" \"${REMOTE_ROOT}\""

# Produce a fully-escaped JSON payload for send-command
PAYLOAD="$(jq -n \
  --arg iid "$INSTANCE_ID" \
  --arg cmd "$REMOTE_CMD" \
  '{
     DocumentName: "AWS-RunShellScript",
     InstanceIds: [$iid],
     Parameters: {
       commands: [$cmd],
       executionTimeout: ["900"],
       workingDirectory: ["/home/ec2-user"]
     }
   }')"

CMD_ID="$(aws ssm send-command --cli-input-json "$PAYLOAD" --query "Command.CommandId" --output text)"
echo "SSM CommandId: $CMD_ID"

echo "[5/5] Poll to completion"
for i in $(seq 1 40); do
  STATUS="$(aws ssm get-command-invocation --command-id "$CMD_ID" --instance-id "$INSTANCE_ID" --query Status --output text || true)"
  echo "SSM status: $STATUS"
  case "$STATUS" in
    Success)
      echo "=== STDOUT (success) ==="
      aws ssm get-command-invocation --command-id "$CMD_ID" --instance-id "$INSTANCE_ID" --query StandardOutputContent --output text || true
      break ;;
    Failed|Cancelled|TimedOut)
      echo "=== STDOUT ==="
      aws ssm get-command-invocation --command-id "$CMD_ID" --instance-id "$INSTANCE_ID" --query StandardOutputContent --output text || true
      echo "=== STDERR ==="
      aws ssm get-command-invocation --command-id "$CMD_ID" --instance-id "$INSTANCE_ID" --query StandardErrorContent --output text || true
      exit 1 ;;
    *) sleep 5 ;;
  esac
done
