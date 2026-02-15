FROM nginx:alpine
COPY . /usr/share/nginx/html
# lightweight, content already static
EXPOSE 80
CMD ["nginx","-g","daemon off;"]
