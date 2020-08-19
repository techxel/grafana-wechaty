## 定时获取`grafana`保存的监控图表(巡检), 接受`grafana webhook`(告警信息), 转发至微信群组


#### 安装nodejs

    # centos
    yum install nodejs
    # mac
    brew install node

#### 如果使用`windows`, 需要先安装依赖, 其他平台跳过

    npm install -g windows-build-tools
    npm install -g node-gyp

#### 安装`typescript`环境

    npm install ts-node -g
    npm install typescript -g

#### 安装项目依赖

    cd my-padplus-bot
    tsc --init --target ES6
    npm install

> 如果环境为`linux`, 需有`g++`编译环境, 才能安装`wechaty-puppet-padplus`

> yum install gcc-c++

#### 启动项目(请先修改`bot.js`里面的参数)

    ts-node bot.js


