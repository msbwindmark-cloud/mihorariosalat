import requests

def fetch_prayer_times(city: str, country: str):
    # Usamos la API de Aladhan
    url = f"http://api.aladhan.com/v1/timingsByCity?city={city}&country={country}&method=3"
    try:
        response = requests.get(url)
        response.raise_for_status()
        return response.json()['data']
    except Exception as e:
        return {"error": str(e)}