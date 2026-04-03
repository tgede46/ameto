# Guide WebSocket - Notifications en Temps Réel

## 📡 Configuration WebSocket

Les notifications sont maintenant envoyées en temps réel via WebSocket grâce à Django Channels.

### URL de connexion
```
ws://localhost:8000/ws/notifications/
```

## 🔌 Connexion au WebSocket

### JavaScript (Frontend)
```javascript
// Connexion au WebSocket
const token = localStorage.getItem('auth_token'); // Votre token JWT
const ws = new WebSocket('ws://localhost:8000/ws/notifications/');

// Événement : Connexion établie
ws.onopen = function(e) {
    console.log('Connecté aux notifications en temps réel');
};

// Événement : Réception d'une notification
ws.onmessage = function(event) {
    const data = JSON.parse(event.data);

    if (data.type === 'notification') {
        console.log('Nouvelle notification reçue:', data);
        // Afficher la notification à l'utilisateur
        showNotification(data.titre, data.message);
    }
};

// Événement : Erreur
ws.onerror = function(error) {
    console.error('Erreur WebSocket:', error);
};

// Événement : Déconnexion
ws.onclose = function(event) {
    console.log('Déconnecté du WebSocket');
};
```

### Python (Client Test)
```python
import asyncio
import websockets
import json

async def test_notifications():
    uri = "ws://localhost:8000/ws/notifications/"

    async with websockets.connect(uri) as websocket:
        # Attendre les notifications
        while True:
            message = await websocket.recv()
            data = json.loads(message)
            print(f"Notification reçue: {data}")

# Exécuter
asyncio.run(test_notifications())
```

## 📨 Format des Messages

### Message de connexion
```json
{
    "type": "connection_established",
    "message": "Connecté aux notifications en temps réel"
}
```

### Notification reçue
```json
{
    "type": "notification",
    "id": 1,
    "titre": "Nouveau paiement",
    "message": "Un paiement de 50000 CFA a été reçu",
    "type_notification": "PAIEMENT",
    "lu": false,
    "date_envoi": "2026-03-20T16:00:00Z"
}
```

## 🔧 Actions depuis le client

### Marquer une notification comme lue
```javascript
// Envoyer une action au serveur
ws.send(JSON.stringify({
    action: 'mark_as_read',
    notification_id: 123
}));
```

Réponse :
```json
{
    "type": "notification_marked",
    "notification_id": 123,
    "message": "Notification marquée comme lue"
}
```

## 🧪 Test avec Postman / Insomnia

1. Ouvrir Postman ou Insomnia
2. Créer une nouvelle requête WebSocket
3. URL : `ws://localhost:8000/ws/notifications/`
4. Se connecter
5. Observer les notifications en temps réel

## 🔐 Authentification

Le WebSocket utilise l'authentification Django par session. L'utilisateur doit être connecté pour recevoir ses notifications.

Pour une authentification par token JWT :
```javascript
const ws = new WebSocket('ws://localhost:8000/ws/notifications/');
// Envoyer le token après connexion
ws.onopen = function() {
    ws.send(JSON.stringify({
        action: 'authenticate',
        token: 'your-jwt-token'
    }));
};
```

## 📦 Exemple d'intégration React

```javascript
import { useEffect, useState } from 'react';

function useNotifications() {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const ws = new WebSocket('ws://localhost:8000/ws/notifications/');

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'notification') {
                setNotifications(prev => [data, ...prev]);
                // Afficher une toast notification
                toast.info(data.titre);
            }
        };

        return () => ws.close();
    }, []);

    return notifications;
}

// Utilisation dans un composant
function NotificationBell() {
    const notifications = useNotifications();

    return (
        <div>
            <Badge count={notifications.filter(n => !n.lu).length}>
                <BellIcon />
            </Badge>
        </div>
    );
}
```

## 🚀 Comment déclencher une notification

Depuis n'importe où dans le code Django :

```python
from notification.services import NotificationService

# Envoyer une notification
NotificationService.envoyer(
    destinataire=user,
    type_notif='PAIEMENT',
    message='Un paiement de 50000 CFA a été reçu',
    titre='Nouveau paiement'
)

# La notification sera automatiquement envoyée via WebSocket
# à tous les clients connectés de cet utilisateur
```

## 🔍 Débogage

Vérifier que le serveur WebSocket fonctionne :
```bash
# Vérifier les logs du serveur
python manage.py runserver

# Le serveur utilisera maintenant Daphne (ASGI) au lieu de runserver classique
# pour supporter les WebSockets
```

## 📝 Notes importantes

- Le serveur doit être lancé avec Daphne (ASGI) pour supporter les WebSockets
- Les notifications sont envoyées uniquement aux utilisateurs connectés
- Si l'utilisateur n'est pas connecté, la notification reste en base de données
- Utilisez `channels-redis` en production pour gérer plusieurs serveurs
