# trimperson
TRIM API wrapper

## Installation

```
npm install --save mediasuitenz/trimperson#v1.0.0
```

## Usage
### setup module:
```js
var trim = require('trim')({
  url: 'http://path/to/trim/api',
  token: 'trim-api-security-token'
})
```


### TRIM data

Data returned from find looks like:
```json
{
  "containerNo": "BC140111",
  "subContainers": [
    {
      "containerNo": "BC140111#05",
      "subContainers": [

      ],
      "records": [

      ]
    },
    {
      "containerNo": "BC140111#04",
      "subContainers": [

      ],
      "records": [
        {
          "recordNo": "1448586",
          "hyperlink": "http://emap.marlborough.govt.nz/trim/api/trim/get?id=1448586",
          "recordTitle": "2014-2-24 - Inspection - Jetties - gla        - Pass",
          "recordType": "pdf",
          "recordSize": 48519,
          "dateCreated": "2014-02-24T11:56:43",
          "dateRegistered": "2014-02-24T11:56:43",
          "dateFinalized": "2014-02-24T11:56:43",
          "author": ""
        },
        {
          "recordNo": "1448587",
          "hyperlink": "http://emap.marlborough.govt.nz/trim/api/trim/get?id=1448587",
          "recordTitle": "2014-2-24 - Inspection - Veneer Half High - gla        - Pass",
          "recordType": "pdf",
          "recordSize": 48816,
          "dateCreated": "2014-02-24T11:56:47",
          "dateRegistered": "2014-02-24T11:56:47",
          "dateFinalized": "2014-02-24T11:56:47",
          "author": ""
        }
      ]
    },
    {
      "containerNo": "BC140111#03",
      "subContainers": [

      ],
      "records": [
        {
          "recordNo": "13228764",
          "hyperlink": "http://emap.marlborough.govt.nz/trim/api/trim/get?id=13228764",
          "recordTitle": "Issued Building Consent - Building Act 2004 - Field Sheet",
          "recordType": "pdf",
          "recordSize": 77824,
          "dateCreated": "2013-08-12T11:08:36",
          "dateRegistered": "2013-08-12T11:08:38",
          "dateFinalized": "2013-08-15T16:37:31",
          "author": "Cheryl Ewan"
        },
        {
          "recordNo": "13246844",
          "hyperlink": "http://emap.marlborough.govt.nz/trim/api/trim/get?id=13246844",
          "recordTitle": "Engineer involvement in inspections",
          "recordType": "pdf",
          "recordSize": 241152,
          "dateCreated": "2013-08-22T12:29:07",
          "dateRegistered": "2013-08-22T12:29:10",
          "dateFinalized": "2013-08-22T12:40:04",
          "author": "Cheryl Ewan"
        }
      ]
    },
    {
      "containerNo": "BC140111#02",
      "subContainers": [

      ],
      "records": [
        {
          "recordNo": "1448229",
          "hyperlink": "http://emap.marlborough.govt.nz/trim/api/trim/get?id=1448229",
          "recordTitle": "Drainage Plan - TEST",
          "recordType": "pdf",
          "recordSize": 140203,
          "dateCreated": "2014-02-21T14:07:46",
          "dateRegistered": "2014-02-24T07:16:45",
          "dateFinalized": "2014-02-24T07:17:38",
          "author": ""
        }
      ]
    },
    {
      "containerNo": "BC140111#01",
      "subContainers": [

      ],
      "records": [

      ]
    }
  ],
  "records": [

  ]
}
```

#Development

1. Get the code `git checkout git@github.com:mediasuitenz/trimperson.git`
2. Install dependencies `cd trimperson && npm install`
3. Run tests `npm run test`
4. alternative to (3) run `npm run test:watch` to have tests run whenever a file changes

