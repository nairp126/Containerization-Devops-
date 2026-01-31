import os

def main():
    base_dir = "lab"
    header = "\n### 📸 Visuals & Outputs\n"
    
    # Walk through the lab directory
    for root, dirs, files in os.walk(base_dir):
        # We only care if there is a README.md in the directory
        if "README.md" not in files:
            continue
            
        readme_path = os.path.join(root, "README.md")
        images = [f for f in files if f.lower().endswith(('.png', '.jpg', '.jpeg', '.gif'))]
        
        if not images:
            continue
            
        with open(readme_path, "r", encoding="utf-8") as f:
            content = f.read()
            
        new_content = content
        header_added = header.strip() in new_content
        
        images_to_add = []
        for img in images:
            # Check if the image is already referenced in the file
            # We look for the filename in a standard markdown link structure or just the filename availability
            # The prompt requested checking if the image is referenced.
            # Simple check: is the filename present in the content?
            # A more robust check would be looking for ](filename)
            if f"({img})" not in content:
                images_to_add.append(img)
                
        if not images_to_add:
            continue
            
        # Append header if it doesn't exist and we are adding images
        if not header_added:
            new_content += header
            header_added = True # Mark as added so we don't add it again conceptually, though we just appended bytes
            
        for img in images_to_add:
            # Append image using markdown syntax
            # Ensure there is a newline before
            if not new_content.endswith("\n"):
                new_content += "\n"
            new_content += f"\n![{img}]({img})\n"
            print(f"Added {img} to {readme_path}")
            
        if new_content != content:
            with open(readme_path, "w", encoding="utf-8") as f:
                f.write(new_content)

if __name__ == "__main__":
    main()
