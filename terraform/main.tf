################################
# Provider / Region (us-east-2)
################################
provider "aws" {
  region = "us-east-2"
}

################################
# Your public IP (for SSH allowlist)
################################
data "http" "my_ip" {
  url = "https://checkip.amazonaws.com/"
}

locals {
  my_ip = chomp(data.http.my_ip.response_body)
}

################################
# Latest Amazon Linux 2 AMI (x86_64, HVM, gp2)
################################
data "aws_ami" "al2" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }
  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

################################
# Security group: HTTP 80 (world), SSH 22 (your IP)
################################
resource "aws_security_group" "web_sg" {
  name        = "ssg-examples-sg"
  description = "Allow HTTP 80 from the world and SSH from my IP"

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "SSH from my IP"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["${local.my_ip}/32"]
  }

  egress {
    description = "All egress"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "ssg-examples-sg"
  }
}

################################
# EC2 instance (Docker prepped; container managed by workflow)
################################
resource "aws_instance" "web" {
  ami                    = data.aws_ami.al2.id
  instance_type          = "t3.micro"
  key_name               = var.ssh_key_name
  vpc_security_group_ids = [aws_security_group.web_sg.id]

  user_data = <<-EOF
              #!/bin/bash
              set -euxo pipefail
              yum update -y
              amazon-linux-extras install docker -y || yum install -y docker
              systemctl enable docker || true
              systemctl start docker || service docker start || true
              # NOTE: Container creation is handled by GitHub Actions deploy.yml
              EOF

  tags = {
    Name = "ssg-examples"
  }
}

################################
# Outputs
################################
output "public_ip" {
  value = aws_instance.web.public_ip
}

output "public_dns" {
  value = aws_instance.web.public_dns
}
