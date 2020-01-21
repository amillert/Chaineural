import requests
import time
import numpy as np


headers = {
    'Content-type': 'application/json',
}

data = '{"text":"Hello, World!"}'

# for orgNumber in range(2, 5):
#         seed(1)
#         print(orgNumber)
#         response = requests.post('http://localhost:900' + str(orgNumber) + '/api/init-minibatch/epoch2/70' + str(orgNumber) + '/worker', headers=headers, data=data)
#         print(response)
#         time.sleep(5)
#         response = requests.post('http://localhost:900' + str(orgNumber) + '/api/finish-minibatch/epoch2/70' + str(orgNumber) + '/1.23/0.12', headers=headers, data=data)
#         print(response)
#         print(response)
#         time.sleep(10)

for z in range(1, 3):
    for x in range(97, 150):
        orgNumber = np.random.randint(1,5)
        print(orgNumber)
        # time.sleep(1)
        print(x)
        print('http://localhost:900' + str(orgNumber) \
            + '/api/init-minibatch/epoch' + str(z) + '/' + str(x) \
            + '/worker')
        response = requests.post('http://localhost:900'
                                 + str(orgNumber)
                                 + '/api/init-minibatch/epoch' + str(z)
                                 + '/' + str(x) + '/worker',
                                 headers=headers, data=data)
        print(response)
        # time.sleep(1)
        print('http://localhost:900' + str(orgNumber) \
            + '/api/finish-minibatch/epoch' + str(z) + '/' + str(x) \
            + '/1.23/0.12')
        response = requests.post('http://localhost:900'
                                 + str(orgNumber)
                                 + '/api/finish-minibatch/epoch'
                                 + str(z) + '/' + str(x) + '/1.23/0.12'
                                 , headers=headers, data=data)
        print(response)