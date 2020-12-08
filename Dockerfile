FROM node:14 AS build

WORKDIR /app

COPY package.json ./
COPY yarn.lock ./
RUN yarn --frozen-lockfile

COPY . ./
RUN yarn build

FROM nginx

ARG BUILD_TIMESTAMP
ARG BUILD_COMMIT_HASH
ARG BUILD_RELEASE_VERSION

ENV REACT_APP_BUILD_TIMESTAMP=$BUILD_TIMESTAMP
ENV REACT_APP_COMMIT_HASH=$BUILD_COMMIT_HASH
ENV REACT_APP_RELEASE_VERSION=$BUILD_RELEASE_VERSION

ENV PORT=3000
ENV METAFLOW_SERVICE=/api

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf.template /etc/nginx/templates/default.conf.template