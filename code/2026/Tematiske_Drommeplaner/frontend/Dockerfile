FROM node:20-alpine as build

WORKDIR /app

ARG VITE_BASE_PATH=/mikro-drommeplan/
ARG VITE_API_BASE=/mikro-drommeplan/api
ARG VITE_AUTH_BASE=/mikro-drommeplan/api/auth
ENV VITE_BASE_PATH=${VITE_BASE_PATH}
ENV VITE_API_BASE=${VITE_API_BASE}
ENV VITE_AUTH_BASE=${VITE_AUTH_BASE}

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]