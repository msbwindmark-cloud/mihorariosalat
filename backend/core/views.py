from django.shortcuts import render

from rest_framework.decorators import api_view
from rest_framework.response import Response
from .prayer_service import fetch_prayer_times

@api_view(['GET'])
def get_schedule(request):
    city = request.query_params.get('city', 'Madrid')
    country = request.query_params.get('country', 'Spain')
    
    data = fetch_prayer_times(city, country)
    return Response(data)