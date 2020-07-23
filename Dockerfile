FROM node:14 AS build

WORKDIR /app

COPY package.json ./
COPY yarn.lock ./
RUN yarn --frozen-lockfile

COPY . ./
RUN yarn build

FROM nginx

ENV METAFLOW_SERVICE=/api

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf.template /etc/nginx/templates/default.conf.template