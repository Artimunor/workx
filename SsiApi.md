# Issue
Example of issuing one document (named NAW) with two data points: first and last name.
*This example issues two verifiable credentials, sharing the same document uuid.*

```text
https://ssi-api.link/sessions
```

* Method: `POST`
* Headers:
  * `content-type: application/json`
  * `authorization: 'Basic {APIKEY}'`
* Body:

```json
{
    "toAttest": {
        "NAW": {
            "predicates": {
                "firstName": "jan",
                "lastName": "jansen"
            }
        }
    },
    "toVerify": [],
    "userId": "abc"
}
```

**Example response**: The request will return a JSON response, e.g.

```json
{
  "sessionId": "9a47fad8-60d6-4a5a-9d5b-8ac3142b0b1a",
  "qrcode": "https://ssi-api.link/challenges?sessionId=9a47fad8-60d6-4a5a-9d5b-8ac3142b0b1a",
  "transactionId": "81787d44-22ea-41a9-9a41-3ab1142b031cd"
}
```

## QR Code

The **Issuer Portal** must render a QR code using this payload:
```
{"inviteURL":"{qrcode session link}","operationType":"issuing", "documentName": "testdocument"}
```

*IDA wallet might take a few seconds to load the document without clear user feedback. If the document store appears to be empty, switch to another tab and try again.*

## Issue status

```text
https://ssi-api.link/transactions/TRANSACTION-ID
```

* Method: `GET`
* Headers:
  * `content-type: application/json`
  * `authorization: 'Basic {APIKEY}'`

**Example response**: The request will return a JSON response, e.g.

```json
[
    {
        "id": "1551bee5-a1c5-4b6c-bda4-4330041eb96f",
        "userId": "abc",
        "predicates": [
            "firstName"
        ],
        "status": "CONFIRMED"
    },
    {
        "id": "8137dfbe-67c7-4435-bd29-bead0189969e",
        "userId": "abc",
        "predicates": [
            "lastName"
        ],
        "status": "CONFIRMED"
    }
]
```
*It might take some a minute until the status becomes CONFIRMED. At that point, the credential can be presented to the verifier.*

*Note: If you get an empty array, the phone hasn't contacted the API yet.*

# Verify
Receive two datapoints from one single document.
*The context describes the document. You can request a predicate from any document context, issued by any of the allowed issuers. When requesting multiple datapoints from the same document, ensure that they share the same correlationGroup value.*

```text
https://ssi-api.link/sessions
```

* Method: `POST`
* Headers:
  * `content-type: application/json`
  * `authorization: 'Basic {APIKEY}'`
* Body:

```javascript
{
    "toAttest": {},
    "toVerify": [
        {
            "@context": ["NAW"],
            "predicate": "firstName",
            "correlationGroup": "1",
            "allowedIssuers": [
                "did:eth:0x9e4751F9D87268108E0e824a714e225247731D0d"
            ]
        },
        {
            "@context": ["NAW"],
            "predicate": "lastName",
            "correlationGroup": "1",
            "allowedIssuers": [
                "did:eth:0x9e4751F9D87268108E0e824a714e225247731D0d"
            ]
        }
    ],
    "userId": "112312"
}
```

**Example response**: The request will return a JSON response, e.g.

```json
{
  "sessionId": "a0e3fe9b-60d6-4a5a-9d5b-b20752c68e5f",
  "qrcode": "https://ssi-api.link/challenges?sessionId=a0e3fe9b-60d6-4a5a-9d5b-b20752c68e5f",
  "transactionId": "81787d44-22ea-41a9-9a41-9fbd69a8f4c2"
}
```

## QR Code

The **Verifier Portal** must render a QR code using this payload:
```
{"inviteURL":"{qrcode session link}","operationType":"verification", "documentName": "testdocument"}
```

*If the app shows an infinite loading screen, close the app and try again. Make sure that the credentials were issued correctly by checking the issuer transaction id.*

## Poll for data

```text
https://ssi-api.link/verification-status/TRANSACTION-ID
```

*If the phone did not send any data yet, this endpoint will return an empty array. This will be improved soon.*

* Method: `GET`
* Headers:
  * `content-type: application/json`
  * `authorization: 'Basic {APIKEY}'`

**Example response**: Once the wallet sent the data to our endpoint, the response will be as follows:

```json
[
    {
        "id": "fb3987d3-642d-493a-8b9f-9eee1626f1ff",
        "did": "did:eth:0x2F8052Ae61553c4420E8178C703607bF7154c9fD",
        "issuer": "did:eth:0x9e4751F9D87268108E0e824a714e225247731D0d",
        "predicateValues": {
            "lastName": "jansen",
            "documentId": "afb492e6-6ea8-456a-b417-bdde3bc615f0"
        },
        "status": "CONFIRMED"
    },
    {
        "id": "3ca9cec9-1d6d-4e5f-aadd-d2565def22d0",
        "did": "did:eth:0x031c72DDC97abE7e712D3ade2395e2D2d44C69ae",
        "issuer": "did:eth:0x9e4751F9D87268108E0e824a714e225247731D0d",
        "predicateValues": {
            "firstName": "jan",
            "documentId": "afb492e6-6ea8-456a-b417-bdde3bc615f0"
        },
        "status": "CONFIRMED"
    }
]
```


## Verify examples

**IBAN**
First add the dummy IBAN details to the app using the 'toevoegen' tab.
Then open this verify request:

```json
{
  "toAttest": {},
  "toVerify": [{
                   "predicate": "IBAN",
                   "@context": ["Bank_Account_Data"],
                   "correlationGroup": "1",
                   "allowedIssuers": ["did:eth:0x517f00FC276776C6A7445f5b1A9e5e2c93e829F2"]
                  }],
  "userId": "abc123"
}
```

**Driver's license**
First add the driver's license details to the app using the 'toevoegen' tab.
Then open this verify request:

```json
{
  "toAttest": {},
  "toVerify": [{
                   "predicate": "firstName",
                   "@context": ["http://some-url.com/government-documents#drivers-license"],
                   "correlationGroup": "1",
                   "allowedIssuers": ["did:eth:0x517f00FC276776C6A7445f5b1A9e5e2c93e829F2"]
                  },{
                   "predicate": "lastName",
                   "@context": ["http://some-url.com/government-documents#drivers-license"],
                   "correlationGroup": "1",
                   "allowedIssuers": ["did:eth:0x517f00FC276776C6A7445f5b1A9e5e2c93e829F2"]
                  }],
  "userId": "abc123"
}
```