
all: install

clear:
	@rm -rf .nuxt
	@rm -rf build
	@rm -rf uploadfiles
	@rm -rf node_modules
	@rm -rf pagkage-lock.json
	@rm -rf yarn-error.log
	@rm -rf yarn.lock

install:
	@npm set registry https://registry.npm.taobao.org
	@npm install
	@npm audit fix

reinstall:
	@make clear
	@make install
	
update:
	@npm set registry https://registry.npm.taobao.org
	@npm update

start:
	@pm2 start ecosystem.config.js

restart:
	@pm2 restart ecosystem.config.js

stop:
	@pm2 stop ecosystem.config.js

delete:
	@pm2 delete ecosystem.config.js

initialize:
	@node ./build/initialize.js

clearlogs:
	@rm -rf logs