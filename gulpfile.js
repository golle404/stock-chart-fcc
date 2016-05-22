var gulp = require("gulp");
var clean = require("gulp-rimraf");
var browserify = require("browserify");
var source = require("vinyl-source-stream");
var sass = require("gulp-sass");
var autoprefixer = require("gulp-autoprefixer");
var liveServer = require("gulp-live-server");
var browserSync = require("browser-sync").create();
var reload = browserSync.reload;

var server;

gulp.task("live-server", function(){
	if(!server){
		server = liveServer("server/index.js");	
	}
	server.start();
})

gulp.task("serve",["js", "scss", "live-server", "watch"], function(){
	browserSync.init({
        proxy: "http://127.0.0.1:3333",
        port: 3000
    });
})

gulp.task("browser-reload", function(){
	browserSync.reload();
});

gulp.task("server-restart", function(){
	server.stop();
	server.start();
});

gulp.task("watch", function(){
	gulp.watch("server/views/*.jade",["browser-reload"]);
	gulp.watch("client/js/**/*.js", ["js-watch"]);
	gulp.watch("client/scss/*.scss", ["scss-watch"]);
	gulp.watch("server/**/*.js",["server-watch"]);
})
gulp.task('server-watch', ['server-restart'], function(){
	reload();
});
gulp.task('js-watch', ['js'], function(){
	reload();
});
gulp.task('scss-watch', ['scss'], function(){
	reload({stream: false});
});

gulp.task("js", function(){
	return browserify("client/js/app.js")
	.bundle()
	.on("error", console.error.bind(console))
	.pipe(source("app.js"))
	.pipe(gulp.dest("public/js"));
})

gulp.task("scss", function(){
	return gulp.src("client/scss/style.scss")
	.pipe(sass())
	.pipe(autoprefixer())
	.pipe(gulp.dest("public/css"))
})
gulp.task("clean", function(){
	return gulp.src(["deploy/server/**", "deploy/client/**", "deploy/package.json"], { read: false })
	.pipe(clean());
})
gulp.task("deploy",["clean", "js", "scss"], function(){
	gulp.src(["public/**/*", "public/*", "server/**/*", "package.json"],{base: "./"})
	.pipe(gulp.dest("deploy"));	
})