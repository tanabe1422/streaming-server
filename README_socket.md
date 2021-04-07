Socket.io
===

# emit

## create_room

ルーム作成
他のルームに参加していない場合のみ作成出来ます。

``` typescript
emit( 'create_room', user_name ,callback )
```

### params

| name      | type   | description |
| --------- | ----   | ----------- |
| user_name | string | 新規ユーザ名 |


### callback(obj)

| name     | type     | description |
| -------- | -------- | -------- |
| obj      | object   | ```{ result, room_id }``` |
| result   | boolean  | ルーム作成の成否 |
| room_id  | string   | 作成したルームのid |

<br />
<br />

## join_room

指定したルームIDのルームに参加

```typescript
emit( 'join_room', obj, callback )
```
### params

| name     | type     | description |
| -------- | -------- | -------- |
| obj      | object   |          |
| room_id  | string   | 参加したいルームのID |
| uesr_name| string   | 設定するユーザ名 |

<br />

### callback(result)

| name     | type     | description |
| -------- | -------- | -------- |
| result   | boolean  | 入室の成否 |

<br />
<br />

## check_room

指定したルームIDのルームが存在するかどうか

```typescript
emit( 'check_room', room_id, callback )
```
### params

| name     | type     | description |
| -------- | -------- | -------- |
| room_id  | string   | 参加したいルームのID |

<br />

### callback(result)

| name     | type     | description |
| -------- | -------- | -------- |
| result   | boolean  | ルームの有無 |


<br /><br />

## send_message

ルームにメッセージ送信


```typescript
emit( 'send_message', msg )
```

### params

| name | type     | description |
| ---- | -------- | - |
| msg  | string   | 送信するメッセージ | 

<br /><br />


## set_name

ユーザ名を設定する。重複OK

```typescript
socket.emit('set_name', user_name, callback)
```

### params

| name | type | description |
|-|-|-|
| user_name | string | ユーザ名 |

<br/>

### callback

```typescript
callback(result)
```
| name | type | description |
|-|-|-|
| result | boolean | 名前設定の成否 |

<br/><br/>

# socket.on

## new_message

メッセージ取得

```typescript
socket.on('new_message', fn(obj))
```

### params


| name | type | 説明 |
| -------- | -------- | -------- |
| obj     | object     | ```{ user_id, user_name?, msg }```     |
| user_id | string | ユーザID |
| user_name | string? | ユーザ名 |
| msg | string | メッセージ |

