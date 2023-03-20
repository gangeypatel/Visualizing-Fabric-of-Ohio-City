import json
from sklearn.cluster import KMeans
import numpy as np

# Define the number of clusters you want to create
n_clusters = 10000

# Load the x,y coordinate data from the JSON file
print("Loading data...")
with open('data/basemap_points.json', 'r') as f:
    data = json.load(f)

# Convert the data to a numpy array
data = np.array(data)

# Create an instance of the k-means clustering algorithm
print("Creating KMeans instance...")
kmeans = KMeans(n_clusters=n_clusters)

# Fit the algorithm to your data
print("Fitting KMeans model...")
kmeans.fit(data)

# Get the cluster assignments for each point
labels = kmeans.labels_

# Print the number of points in each cluster
print("Number of points in each cluster:")
for i in range(n_clusters):
    print(f"Cluster {i}: {np.sum(labels == i)} points")

# Get the centroids of each cluster
centroids = kmeans.cluster_centers_

# Merge nearby points within each cluster by taking the average of their coordinates
merged_points = []
for i in range(n_clusters):
    print(f"Merging cluster {i}...")
    cluster_points = data[labels == i]
    merged_point = np.mean(cluster_points, axis=0)
    merged_points.append(merged_point.tolist())  # Convert numpy array to list

# Print the number of merged points
print(f"Number of merged points: {len(merged_points)}")

# Write the merged points to a JSON file
print("Writing output to file...")
with open('data/merged_points.json', 'w') as f:
    json.dump(merged_points, f)

print("Done!")
