INDRA VISION
============

Files:
- index.html
- style.css
- script.js

FEATURES
--------
1. Cinematic "Eye of the Sky" landing page.
2. India map displayed inside the Earth at the top.
3. Navigation buttons for Live Weather, Explore, Climate Trends, India and About.
4. Browser geolocation for the user's precise coordinates when permission is granted.
5. Current place name + state/region + country + latitude + longitude + timezone + elevation.
6. Real current weather using Open-Meteo.
7. The same Open-Meteo source is used for the user's location and every explored location, keeping temperature readings consistent.
8. Random place exploration by interest:
   Cities, Mountains, Beaches, Forests, Deserts and Heritage.
9. Climate-change section ready to connect to your historical temperature/rainfall dataset.
10. Responsive mobile navigation.

IMPORTANT
---------
- Geolocation only works after the user grants browser permission.
- For local development, use VS Code Live Server or another localhost server.
- Some browsers block geolocation when opening index.html directly with file://.
- Internet is required for live weather, reverse geocoding, Google Fonts and the India SVG map.
- For a fully self-contained/offline project, download the India SVG and fonts locally.

DATA SOURCES
------------
Weather: Open-Meteo API
Reverse geocoding: BigDataCloud Reverse Geocode Client
India outline: Wikimedia Commons, CC BY-SA 3.0

For a college submission, add a small "Data Sources" section/slide in your project presentation.
