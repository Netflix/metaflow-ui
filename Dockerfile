FROM node:14-alpine AS build

ARG BUILD_TIMESTAMP
ARG BUILD_COMMIT_HASH
ARG BUILD_RELEASE_VERSION

ENV REACT_APP_BUILD_TIMESTAMP=$BUILD_TIMESTAMP
ENV REACT_APP_COMMIT_HASH=$BUILD_COMMIT_HASH
ENV REACT_APP_RELEASE_VERSION=$BUILD_RELEASE_VERSION

WORKDIR /app

COPY package.json ./
COPY yarn.lock ./
RUN yarn --frozen-lockfile

COPY . ./
RUN yarn build

FROM nginx

ENV PORT=3000
ENV METAFLOW_SERVICE=/api

# nginx.conf.template environment variables
# for injecting content to index.html during runtime
ENV METAFLOW_HEAD=''
ENV METAFLOW_BODY_BEFORE=''
ENV METAFLOW_BODY_AFTER=''

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf.template /etc/nginx/templates/default.conf.template