import requests
import time
import numpy as np


headers = {
    'Content-type': 'application/json',
}

data = '{"text":"Hello, World!"}'

print('Test put')
response = requests.post('http://localhost:9001/api/put-test-data/test5', headers=headers, data=data, timeout=999999999)
print(response)
response = requests.post('http://localhost:9002/api/put-test-data/test2', headers=headers, data=data, timeout=999999999)
print(response)
response = requests.post('http://localhost:9003/api/put-test-data/test3', headers=headers, data=data, timeout=999999999)
print(response)
response = requests.post('http://localhost:9004/api/put-test-data/test4', headers=headers, data=data, timeout=999999999)
print(response)

# minibatchAmount = 20
# for z in range(1, 2):
#     for x in range(1, minibatchAmount):
#         if x == minibatchAmount-1:
#             for org in range(1, 5):
#                 print('http://localhost:900' + str(org) \
#                     + '/api/init-minibatch/epoch' + str(z) + '/' + str(x) \
#                     + '/worker')
#                 try:
#                     requests.post('http://localhost:900'
#                                     + str(org)
#                                     + '/api/init-minibatch/epoch' + str(z)
#                                     + '/' + str(x) + '/worker',
#                                     headers=headers, data=data,timeout=0.0000000001)
#                 except requests.exceptions.ReadTimeout: 
#                     pass
#                 time.sleep(0.30)
#                 print('http://localhost:900' + str(org) \
#                     + '/api/finish-minibatch/epoch' + str(z) + '/' + str(x) \
#                     + '/1.23/0.12')
#                 try:
#                     requests.post('http://localhost:900'
#                                  + str(org)
#                                  + '/api/finish-minibatch/epoch'
#                                  + str(z) + '/' + str(x) + '/1.23/0.12'
#                                  , headers=headers, data=data,timeout=0.0000000001)
#                 except requests.exceptions.ReadTimeout: 
#                     pass
#                 time.sleep(0.30)
#         else:
#             orgNumber = np.random.randint(1,5)
#             print(orgNumber)
#             # time.sleep(1)
#             print(x)
#             print('http://localhost:900' + str(orgNumber) \
#                 + '/api/init-minibatch/epoch' + str(z) + '/' + str(x) \
#                 + '/worker')
#             try:
#                 requests.post('http://localhost:900'
#                                      + str(orgNumber)
#                                      + '/api/init-minibatch/epoch' + str(z)
#                                      + '/' + str(x) + '/worker',
#                                      headers=headers, data=data,timeout=0.0000000001)
#             except requests.exceptions.ReadTimeout: 
#                     pass
#             time.sleep(0.30)
#             print('http://localhost:900' + str(orgNumber) \
#                 + '/api/finish-minibatch/epoch' + str(z) + '/' + str(x) \
#                 + '/1.23/0.12')
#             try:
#                 requests.post('http://localhost:900'
#                                      + str(orgNumber)
#                                      + '/api/finish-minibatch/epoch'
#                                      + str(z) + '/' + str(x) + '/1.23/0.12'
#                                      , headers=headers, data=data,timeout=0.0000000001)
#             except requests.exceptions.ReadTimeout: 
#                     pass
#             time.sleep(0.30)


# ======== FOR TESTS PURPOSES ======
# print('Test TPS')
# response = requests.get('http://localhost:9001/api/test-TPS/epoch1/2000', headers=headers, data=data, timeout=999999999)