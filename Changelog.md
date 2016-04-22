# v3.0.0
Introduce better access control.

## Creating Records
- Change createRecord parameters to accept a data object in instead of a bunch of sequential parameters
- createRecord will still accept sequential parameters for backwards compatibility
- createRecord accepts new privacyLevel parameter
- add createPrivateRecord
- add createPublicRecord

## Fetching Containers

- add getPublicContainer

## Creating containers

- Change createContainer parameters to accept a data object instead of a bunch of sequential parameters
- createContainer will still accept sequential parameters for backwards compatibility
- createContainer accepts new privacyLevel parameter
- Add createPublicContainer
- Add createPrivateContainer

## Error handling
The requests now actually handle error responses instead of relying on consumers to
parse and intuit the meaning of responses. A bunch of error conditions have been introduced
that will return error values in the response callbacks.


# v2.2.1
Unrecorded.
