// bot.ts
import { Contact, Message, Wechaty } from 'wechaty'
import { ScanStatus } from 'wechaty-puppet'
import { PuppetPadplus } from 'wechaty-puppet-padplus'
import QrcodeTerminal from 'qrcode-terminal'

import FileBox from 'file-box'

import http from 'http'

const token = '你自己的token, 需要联系wechaty客服'

const puppet = new PuppetPadplus({
  token,
})

const name  = '你自己自定义名称'

const bot = new Wechaty({
  puppet,
  name, // generate xxxx.memory-card.json and save login data for the next login
})

bot
  .on('scan', (qrcode, status) => {
    if (status === ScanStatus.Waiting) {
      QrcodeTerminal.generate(qrcode, {
        small: true
      })
    }
  })
  .on('login', (user: Contact) => {
    console.log(`login success, user: ${user}`)

    // 如果你想启动后, 发送一条通知给你的好友
    bot.Contact.find({id: '你的好友微信号'}).then(master => {
      if(master != null) {
        console.log(master)
        master.say("hello master!")
      }
    })

    // 如果你想启动后, 发送一条消息给监控群组
    bot.Room.load('你的room id, 可以通过message调试信息获取').say("巡检已启动!")

    // 样例, 整点发送grafana保存的监控图片
    setInterval(function() {
      const data = new Date()
      const hour = data.getHours()
      const min = data.getMinutes()
      console.log("current minutes: " + min)
      if(hour > 8 && hour < 19 && min == 5) {
        const year = data.getFullYear()
        const month = data.getMonth() + 1  // 0 - 11, 0 means Jan
        const day = data.getDate()

        // 发送grafana保存的监控图片
        const filePath = year + '/' + month + '/' + day + '/' + hour + '.png'
        console.log('file path: ' + filePath)
        const fileBox = FileBox.fromUrl('http://你的图片地址/' +  filePath)
        bot.Room.load('你的room id').say(fileBox)
      }
    }, 60*1000);

    // 样例, 接受grafana webhook, 发送相关告警信息和图片至微信监控群组
    const server = http.createServer((req, res) => {

      if (req.method === 'POST') {
        // receive POST data
        let body = '';
        req.on('data', chunk => {
          body += chunk.toString(); // convert Buffer to string
        });
        // if completed
        req.on('end', () => {
          console.log(body);
          const obj = JSON.parse(body);

          const room = bot.Room.load('你的room id')

          // 发送告警标题
          room.say(obj.title)

          // 发送告警数据
          let msg = ''
          obj.evalMatches.forEach((match: { metric: string; value: string }) => {
            msg += (match.metric + ': ' + match.value)
            msg += '\n'
          });
          if(msg != '') {
            room.say(msg)
          }

          // 发送告警图表
          const fileBox = FileBox.fromUrl(obj.imageUrl)
          room.say(fileBox)

        });
      }
    
      res.end('Hello, World!');      

    });

    server.listen(8080);

  })
  .on('message', (msg: Message) => {
    console.log(`msg : ${msg}`)
    console.log(msg)
  })
  .on('logout', (user: Contact, reason: string) => {
    console.log(`logout user: ${user}, reason : ${reason}`)
  })
  .start()
