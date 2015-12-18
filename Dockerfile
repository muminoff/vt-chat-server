FROM centos:latest
MAINTAINER Sardor Muminov <smuminov@gmail.com>
RUN yum update -y
RUN yum install git wget libpq-devel -y
WORKDIR /usr/local/src
RUN wget https://nodejs.org/dist/v5.3.0/node-v5.3.0-linux-x64.tar.xz
RUN tar xvf node-v5.3.0-linux-x64.tar.xz
RUN ln -s /usr/local/src/node-v5.3.0-linux-x64/bin/node /usr/local/bin/node
RUN ln -s /usr/local/src/node-v5.3.0-linux-x64/bin/npm /usr/local/bin/npm
RUN node --version
RUN npm --version
ADD . /vt
WORKDIR /vt
RUN npm install
