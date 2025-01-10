# test-technique-cgenial
Quentin RIBAC, mercredi 8 janvier 2025, licence MIT.

Ce dépôt contient ma réalisation, code et documentation, du test technique demandé par la [Fondation CGénial](https://www.cgenial.org/) pour ma candidature au poste de _développeur PHP/JS fullstack_.

Ce développement a été effectué avec :

- OS : Ubuntu Linux v24.04
- IDE : VSCode v1.96.2
- Technos utilisées :
  - PHP v8.2.27 --> on voit sur le [changelog PHP](https://www.php.net/ChangeLog-8.php#PHP_8_2) que de v8.2.24 à v8.2.27, il n'y a eu que des fix d'anomalies.
  - Symfony v7.1.10
    - Maker
    - Twig
    - Validator

## Installation des dépendances
Pour tester ce code, installer les dépendances suivantes :

### PHP 8.2
Sous Ubuntu Linux, PHP 8.2 est installable via les commandes suivantes :

```bash
sudo add-apt-repository ppa:ondrej/php
sudo add-apt-repository ppa:ondrej/apache2
sudo apt update
sudo apt install php8.2 php8.2-cli php8.2-common php8.2-intl php8.2-mbstring php8.2-opcache php8.2-readline php8.2-xdebug php8.2-xml
```

### Composer
Le gestionnaire de dépendances PHP s'installe avec :

```bash
# télécharge composer.phar
wget https://getcomposer.org/installer -O - | php

# déplace l'exécutable dans unr dossier présent dans le $PATH
mv composer.phar ~/.local/bin/composer
```

### Symfony
La ligne de commande Symfony est utilsée pour lancer le projet de manière minimale, sans serveur HTTP type Apache ou Nginx :

```bash
wget https://get.symfony.com/cli/installer -O - | bash
```

## Installation du projet et lancement
Commencer par cloner le projet :

```bash
git clone git@github.com:ribacq/test-technique-cgenial.git
```

Entrer dans le dossier, installer les dépendances (vendor) :

```bash
cd test-technique-cgenial/
composer install
```

Pour finir, lancer le projet :
```bash
symfony server:start
```