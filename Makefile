mocha=./node_modules/mocha/bin/mocha --recursive
folders=lib
dirs=$(addprefix test/,$(folders))
.PHONY: test $(folders) cover
test: $(folders)

lib:
	@$(mocha) test/lib

cover:
	./node_modules/istanbul/lib/cli.js cover node_modules/mocha/bin/_mocha -- --recursive $(dirs)

jenkins:
	@$(mocha) --reporter mocha-jenkins-reporter --colors --reporter-options junit_report_path=./test-reports/report.xml $(dirs)