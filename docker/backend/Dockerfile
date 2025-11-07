# シンプルなPHP+Apacheイメージ（軽量版）
FROM php:8.2-apache-bullseye

# Composer のインストール
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Apache の mod_rewrite を有効化
RUN a2enmod rewrite

# Apache の設定をコピー
COPY ./apache.conf /etc/apache2/sites-available/000-default.conf

# Apacheのデフォルト設定を無効化し、新しい設定を有効化
RUN a2dissite 000-default || true && \
    a2ensite 000-default

# 作業ディレクトリの設定
WORKDIR /var/www/html

# 権限の設定
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html

EXPOSE 80

CMD ["apache2-foreground"]
