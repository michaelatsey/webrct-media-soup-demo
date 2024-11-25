
# Instruction pour test local machine cliente

### **1. Configurer les certificats de confiance et personnels**

Transférer les fichiers générés pour le server dans le répertoire `certificates`
- **`server-webrtc.key`** : La clé privée générée.
- **`server-webrtc.crt`** : Le certificat SSL généré.

### **2. Mettez à jour le fichier `package.json`**

- **<HOST_CLIENT>**: Adresse IP du client. 
- **<PORT_CLIENT>**: Port IP du client. 

### **3. Mettez à jour le `.env`**

- **MEDIASOUP_SERVER_URL**: Url su server mediasoup. 


### **4. Configurez les certificats de confiance et personnels**

 - Ouvrer `crtmgr.msc` sur la machine client
 - Dans le répertoire `Autorité de certification racines de confiance` faites clique droit sur `Certificats` et importez le certificat  `server-webrtc.crt` 
 - Répétez la même opération sur `Certificats` dans le répertoire `Personnel`


### **5. Exécutez le client **

```bash
npm install
```

```bash
npm run secure-dev
```
