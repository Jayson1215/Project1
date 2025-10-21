const mix = require('laravel-mix');

mix.js('resources/js/app.js', 'public/js')
   .react() // enable React & JSX support
   .sass('resources/sass/app.scss', 'public/css')
   .sass('resources/sass/home.scss', 'public/css')
   .sass('resources/sass/Login.scss', 'public/css')
   .sass('resources/sass/dashboard.scss', 'public/css')
   .sass('resources/sass/users.scss', 'public/css') // Users page styles
   .sass('resources/sass/students.scss', 'public/css') // Students page styles
   .sass('resources/sass/faculty.scss', 'public/css') // Faculty page styles
   .sass('resources/sass/departments.scss', 'public/css') // Departments page styles
   .sass('resources/sass/courses.scss', 'public/css') // Courses page styles
   .sass('resources/sass/academicyears.scss', 'public/css') // Academic Years page styles   
   
   .options({
       processCssUrls: false,
   })
   .sourceMaps();

if (mix.inProduction()) {
    mix.version();
}
