from django.shortcuts import render

# api/views.py
from django.http import JsonResponse

def hello(request):
    return JsonResponse({'message': 'Hello from Django!', 'status': 'success'})
