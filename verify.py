import os,json
filePath = "basemap_points.geojson"
import geopandas as gpd
import matplotlib.pyplot as plt

# Load the GeoJSON data from file
geojson_data = gpd.read_file(filePath)

ax = geojson_data.plot(figsize=(10,10), alpha=0.5, edgecolor='k', aspect=1.0)

# Show the plot
plt.show()


