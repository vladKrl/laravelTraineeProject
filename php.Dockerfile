FROM php:8.4.14-fpm-alpine3.22
WORKDIR /var/www/html

RUN apk update

RUN adduser -D -H -s /bin/sh dockuser
RUN chown -R dockuser:dockuser /var/www/html

RUN apk add --no-cache \
    icu-dev \
    postgresql-dev \
    zlib-dev libxpm-dev libwebp-dev freetype-dev libpng-dev libjpeg-turbo-dev \
    imagemagick-dev

# Install xdebug
RUN apk add --no-cache $PHPIZE_DEPS linux-headers \
    && pecl install xdebug \
    && docker-php-ext-enable xdebug \
    && apk del $PHPIZE_DEPS linux-headers

RUN docker-php-ext-install bcmath \
    opcache \
    intl \
    pdo \
    pdo_pgsql \
    gd

# Install composer
COPY --from=composer /usr/bin/composer /usr/bin/composer

RUN rm -rf /var/cache/apk/*

USER dockuser

CMD [ "php-fpm" ]