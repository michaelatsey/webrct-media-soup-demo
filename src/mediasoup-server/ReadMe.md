
# Instruction pour test local

### **1. Configuration du Server Mediasoup**

Configurer le fichier `.env` en renseignant le **HOST** et le **PORT** du server.
```.env
PORT=3004 # port
HOST=192.168.1.150 # host
RTC_MIN_PORT=40000
RTC_MAX_PORT=49999
```

### **2. Mettez à jour le fichier de configuration OpenSSL avec SAN pour les adresses IP**

Dans le fichier de configuration OpenSSL, par exemple `openssl.conf`, et incluez les adresses IP du server et des client dans l'extension SAN.

```ini
[req]
distinguished_name = req_distinguished_name
x509_extensions = v3_req
prompt = no

[req_distinguished_name]
CN = 192.168.1.150  # IP du serveur

[v3_req]
keyUsage = critical, digitalSignature, keyEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
IP.1 = 192.168.1.150  # IP du serveur
IP.2 = 172.18.192.1  # IP du client 1
IP.3 = 172.18.192.4  # IP du client 2
```

### **3. Générer le certificat avec OpenSSL**

Utilisez le fichier de configuration pour générer un certificat SSL incluant les deux adresses IP :

```bash
openssl req -x509 -out server-webrtc.crt \
 -keyout server-webrtc.key \
 -newkey rsa:2048 -nodes -sha256 \
 -config openssl.conf
```

- **`server-webrtc.key`** : La clé privée générée.
- **`server-webrtc.crt`** : Le certificat SSL généré.

Ce certificat contiendra les adresses IP clients et server dans l'extension **Subject Alternative Name**.
**NB:** Déplacer les deux fichiers générer dans le répertoire `./certs ` du projet `./mediasoup-server`

### **4. Configurer les certificats de confiance et personnels**

 - Ouvrer `crtmgr.msc` 
 - Dans le répertoire `Autorité de certification racines de confiance` faites clique droit sur `Certificats` et importez le certificat  `server-webrtc.crt` 
 - Répétez la même opération sur `Certificats` dans le répertoire `Personnel`

### **5. Exécuter le server**

```bash
npm install
```

```bash
npm run start
```

**Exemple de sortie**
``` bash
$ npm run start

> mediasoup-server@1.0.0 start
> node server.js

MediaSoup server running on https://192.168.1.150:3004
Nouveau client connecté : vf7OkCIYC1tcu7gBAAAC
```
