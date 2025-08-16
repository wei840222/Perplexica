#!/bin/sh
set -e

./migrate

exec bun server.js