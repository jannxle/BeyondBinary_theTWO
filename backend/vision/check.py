import google.generativeai as genai
import os

# Configure the API key. It's best to set this as an environment variable (GEMINI_API_KEY).
# If you are in Google Colab, you can use the following line:
# GOOGLE_API_KEY = userdata.get('GOOGLE_API_KEY')
# Otherwise, ensure your environment variable is set.
api_key = os.getenv("GEMINI_API_KEY") 
genai.configure(api_key=api_key)

# Iterate over all available models and print their names
for model in genai.list_models():
    # You can also filter to see which models support the 'generateContent' method
    if 'generateContent' in model.supported_generation_methods:
        print(model.name)