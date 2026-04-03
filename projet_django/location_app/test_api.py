import requests

BASE_URL = "http://127.0.0.1:8000/api"
ADMIN_EMAIL = "admin@admin.com"
ADMIN_PASSWORD = "adminpassword123"

def tester_api():
    print("1. Tentative de connexion (Login)...")
    login_response = requests.post(
        f"{BASE_URL}/auth/login/",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
    )
    
    if login_response.status_code == 200:
        data = login_response.json()
        print("✅ Connexion réussie !")
        print("Données utilisateur :", data.get('utilisateur'))
        
        # Le token d'accès
        access_token = data.get('access')
        
        print("\n2. Tentative d'accès à une route protégée (Propriétaires)...")
        headers = {
            "Authorization": f"Bearer {access_token}"
        }
        
        proprio_response = requests.get(f"{BASE_URL}/proprietaires/", headers=headers)
        if proprio_response.status_code == 200:
            print("✅ Accès autorisé aux propriétaires :", proprio_response.json())
        else:
            print("❌ Erreur d'accès :", proprio_response.status_code, proprio_response.json())
            
    else:
        print("❌ Échec de connexion :", login_response.status_code, login_response.json())

if __name__ == "__main__":
    tester_api()
