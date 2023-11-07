#!/bin/bash
set -o errexit  # Exit the script with error if any of the commands fail
set -o xtrace   # Write all commands first to stderr

ENVIRONMENT=${ENVIRONMENT:-"aws"}
PROJECT_DIRECTORY=${PROJECT_DIRECTORY:-"."}
source "${PROJECT_DIRECTORY}/.evergreen/init-node-and-npm-env.sh"

if [ "$ENVIRONMENT" = "azure" ]; then
  npm run check:oidc-azure
elif [ "$ENVIRONMENT" = "gcp" ]; then
  npm run check:oidc-gcp
else
  echo $OIDC_ATLAS_URI_SINGLE
  echo $OIDC_ATLAS_URI_MULTI

  export OIDC_TOKEN_DIR=${OIDC_TOKEN_DIR}
  export MONGODB_URI_SINGLE=${OIDC_ATLAS_URI_SINGLE}
  export MONGODB_URI_MULTI=${OIDC_ATLAS_URI_MULTI}

  if [ -z "${OIDC_TOKEN_DIR}" ]; then
    echo "Must specify OIDC_TOKEN_DIR"
    exit 1
  fi
  npm run check:oidc
fi
