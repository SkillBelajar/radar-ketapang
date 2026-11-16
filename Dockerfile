FROM dunglas/frankenphp:1-php8.4

# Install ekstensi PHP yang dibutuhkan Laravel, Octane, Redis, dan MySQL
RUN install-php-extensions pdo_mysql redis pcntl opcache zip gd

# Install composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

EXPOSE 8000

COPY docker/php/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
