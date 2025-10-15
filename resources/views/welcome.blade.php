<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>Laravel React Example</title>

        <!-- Fonts -->
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap" rel="stylesheet">
    </head>
    <body class="antialiased">
        <div class="container">
            <h2>JAYSON T. VELASCO BSIT-32</h2>

            <!-- ✅ React component will mount here -->
            <div id="example"></div>
        </div>

        <!-- ✅ Vite (Laravel 9/10/11) -->
        @viteReactRefresh
        @vite('resources/js/example.js')

        <!-- ❌ If you’re on Laravel Mix (older Laravel < 9), use this instead:
        <script src="{{ mix('js/app.js') }}"></script>
        -->
    </body>
</html>
