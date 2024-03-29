# Тестовое задание "Отправка сообщений"
## Используемые технологии
Для решения задачи я выбрал in-memory хранилище Redis. 

В него пишется количество сообщений (вызовов) по подписчикам и группам. Каждой записи в Redis устанавливается TTL,
который отвечает за количество запросов в единицу времени.
По истечении TTL запись будет удалена автоматически.

Для доставки и переотправки сообщений используется очередь RabbitMQ. Для передоставки сообщений используется механизм 
`x-dead-letter` и два `exchange`: один для передоставки сообщений, выкинутых по достижению лимита на отправку одному
подписчику, второй для сообщений выкинутых по достижению лимита на отправку в одну группу.

Для каждой очереди в `exchange` устанавливается TTL, спустя который сообщение будет передоставлено.
Таким образом обеспечивается упорядоченность сообщений по подписчику и группе. 

## Интересные файлы
`lib/amqp-asserts` - создание очередей в RabbitMQ. Именно здесь описывабтся необходимые таймауты для передоставки сообщений.

`lib/rabbit-message-consumer` - обработка сообщений RabbitMQ, механизм переотправки сообщений RabbitMQ.

## Как конфигурировать
За конфигурацию отвечает файл config/config.yaml

В жтом файле можно выделить 4 группы.
* `generator` - в данной группе находятся переменные, которые отвечают за количество подписчиков, 
групп, количество сообщений, которое будет сгенерировано для одного подписчика.
* `redis` - здесь находится структура конфига для подключения к redis
* `rabbit` - здесь находится одно поле - строка подключения к `RabbitMQ`
* `limitations` - этой группе принадлежат поля, настраивающие ограничения на количество операций за единицу времени

##Подробнее о полях в группе
### `generator`
Здесь присутствуют поля:
* `userCount` - количество подписчиков, которое будет сгенерировано
* `groupCount` - количество групп, которое будет сгенерировано
* `messagePerUser` - общее количество сообщений6 которое будет сгенерировано для одного подписчика
### `redis`
Поля для конфигурации подключения к Redis можно посмотреть в официальной документации [здесь](https://github.com/NodeRedis/node_redis#rediscreateclient)
### `rabbit`
Для подключения к `RabbitMQ` мной используется строка подключения `uri`. Подробнее о правилах создания строки подключения
вы можете ознакомиться [здесь](https://www.rabbitmq.com/uri-spec.html)
### `limitations` 
`limitations` - еще одна группа, влияющая на логику исполнения. В нее входят поля:
* `userIntervalMs` - время в миллисекундах от первого запроса, через которое будет сброшено ограничение на количество
отправок по подписчику.
* `groupIntervalMs` - время в миллисекундах от первого запроса, через которое будет сброшено ограничение на количество
отправок по группе.
* `userLimit` - количество разрешенных отправок по подписчику за время `userIntervalMs`
* `groupLimit` -  количество разрешенных отправок по группе за время `groupIntervalMs`
## Как запускать
Для начала убедитесь, что у вас установлен Redis и RabbitMQ. В противном случае запустите их в docker
с помощью docker-compose.yaml

Запуск генератора сообщений производится с помощью комманды:
~~~
npm run gen
~~~
Запуск обработчика (консюмера) производится с помощью комманды:
~~~
npm run run
~~~
