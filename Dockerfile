FROM node:20-alpine3.21

COPY --chmod=555 dist/ /app/oidc-mirage

EXPOSE 8090

USER 405

ENTRYPOINT ["node", "/app/oidc-mirage/index.js"]
