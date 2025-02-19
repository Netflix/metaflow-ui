FROM node:20-alpine AS amd64-build
FROM arm64v8/node:20-alpine AS arm64-build
FROM ${TARGETARCH}-build AS build

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

# https://github.com/docker-library/official-images#architectures-other-than-amd64
FROM nginx AS amd64-nginx
FROM arm64v8/nginx AS arm64-nginx
FROM ${TARGETARCH}-nginx

ENV PORT=3000
ENV METAFLOW_SERVICE=/api

# nginx.conf.template environment variables
# for injecting content to index.html during runtime
ENV METAFLOW_HEAD=''
ENV METAFLOW_BODY_BEFORE=''
ENV METAFLOW_BODY_AFTER=''
ENV MF_DEFAULT_TIME_FILTER_DAYS=''
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
