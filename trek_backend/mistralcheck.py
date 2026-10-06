from mistralai.client import Mistral
import os

client = Mistral(
    api_key="GwjCRD6X9pdtT9S2cnmPePM5rvA4WUZT"
)

response = client.chat.complete(
    model="mistral-small-latest",
    messages=[
        {
            "role": "user",
            "content": "Hello, are you working?"
        }
    ]
)

print(response.choices[0].message.content)