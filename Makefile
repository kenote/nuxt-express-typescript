
all: install

clear:
	@rm -rf .nuxt
	@rm -rf build
	@rm -rf uploadfiles
	@rm -rf node_modules

install:
	@npm set registry https://registry.npm.taobao.org
	@npm install
	
update:
	@npm set registry https://registry.npm.taobao.org
	@npm update