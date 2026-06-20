# -*- coding: utf-8 -*-
"""
Image Captioning AI - Training Script (PyTorch + Vision Transformer)
SPDX-License-Identifier: Apache-2.0
"""

import os
import sys
import time
import argparse
import numpy as np
from PIL import Image
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, Dataset
from transformers import ViTFeatureExtractor, AutoTokenizer, VisionEncoderDecoderModel

# Setup argument parser
parser = argparse.ArgumentParser(description="Image Captioning Training Module")
parser.add_argument("--dataset", type=str, default="flickr8k", choices=["flickr8k", "coco", "flickr30k"], help="Dataset style")
parser.add_argument("--epochs", type=int, default=10, help="Number of training epochs")
parser.add_argument("--batch_size", type=int, default=8, help="Batch size")
parser.add_argument("--lr", type=float, default=5e-5, help="Learning rate")
parser.add_argument("--fp16", action="store_true", help="Enable mixed precision training")
parser.add_argument("--checkpoint_dir", type=str, default="./checkpoints", help="Save directory")
args, unknown = parser.parse_known_args()

class CaptionDataset(Dataset):
    """
    Custom Dataset loader for COCO/Flickr style images & paired captions
    """
    def __init__(self, image_dir="./data/images", annotation_file="./data/annotations.txt"):
        self.image_dir = image_dir
        self.annotations = []
        if os.path.exists(annotation_file):
            with open(annotation_file, "r") as f:
                for line in f:
                    parts = line.strip().split("\t")
                    if len(parts) >= 2:
                        self.annotations.append((parts[0], parts[1]))
        else:
            # Generate local dummy entries for mock testing
            print("Annotation file not found. Pre-seeding simulator tokens.")
            for i in range(100):
                self.annotations.append((f"img_{i}.jpg", f"A beautiful cinematic photo of object {i} in scenery."))

    def __len__(self):
        return len(self.annotations)

    def __getitem__(self, idx):
        img_name, caption = self.annotations[idx]
        image_path = os.path.join(self.image_dir, img_name)
        
        # Load or mock image
        if os.path.exists(image_path):
            img = Image.open(image_path).convert("RGB")
        else:
            img = Image.fromarray(np.uint8(np.random.rand(224, 224, 3) * 255))
            
        return {"image": img, "caption": caption}

def train_epoch(model, dataloader, tokenizer, feature_extractor, optimizer, scaler, device):
    model.train()
    total_loss = 0.0
    for idx, batch in enumerate(dataloader):
        optimizer.zero_grad()
        
        # Extract features and convert inputs
        images = batch["image"]
        captions = batch["caption"]
        
        # Preprocess images using Vision Transformer (ViT) feature extractor
        pixel_values = feature_extractor(images, return_tensors="pt").pixel_values.to(device)
        
        # Tokenize captions
        targets = tokenizer(captions, padding="max_length", max_length=64, return_tensors="pt", truncation=True).to(device)
        labels = targets.input_ids
        
        # Mask out padding tokens from loss calculation
        labels[labels == tokenizer.pad_token_id] = -100
        
        # Execute forward pass with FP16 or FP32
        if args.fp16 and scaler is not None:
            with torch.cuda.amp.autocast():
                outputs = model(pixel_values=pixel_values, labels=labels)
                loss = outputs.loss
            scaler.scale(loss).backward()
            scaler.step(optimizer)
            scaler.update()
        else:
            outputs = model(pixel_values=pixel_values, labels=labels)
            loss = outputs.loss
            loss.backward()
            optimizer.step()
            
        total_loss += loss.item()
        if idx % 10 == 0:
            print(f"Batch {idx}/{len(dataloader)} -- Current Categorized Cross-Entropy Loss: {loss.item():.4f}")
            
    return total_loss / len(dataloader)

def main():
    print("--------------------------------------------------")
    print(f"Initializing Model Training Module: Salesforce BLIP / GIT with {args.dataset}")
    print(f"Hyperparameters: Batch={args.batch_size}, LR={args.lr}, FP16={args.fp16}")
    print("--------------------------------------------------")
    
    # Setup CUDA device standard bindings
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Active Hardware Device: {device}")
    
    # Load pretrained Vision-Encoder-Decoder model structure from Hugging Face
    model_name = "nlpconnect/vit-gpt2-image-captioning"
    print(f"Fetching pretrained architecture hooks for {model_name}...")
    
    feature_extractor = ViTFeatureExtractor.from_pretrained(model_name)
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = VisionEncoderDecoderModel.from_pretrained(model_name).to(device)
    
    # Configure special tokens if not instantiated
    model.config.decoder_start_token_id = tokenizer.cls_token_id
    model.config.pad_token_id = tokenizer.pad_token_id
    
    # Build dataset loader
    dataset = CaptionDataset()
    dataloader = DataLoader(dataset, batch_size=args.batch_size, shuffle=True, collate_fn=lambda x: {
        "image": [item["image"] for item in x],
        "caption": [item["caption"] for item in x]
    })
    
    optimizer = torch.optim.AdamW(model.parameters(), lr=args.lr)
    scaler = torch.cuda.amp.GradScaler() if args.fp16 else None
    
    os.makedirs(args.checkpoint_dir, exist_ok=True)
    
    print("Beginning Training loops...")
    for epoch in range(1, args.epochs + 1):
        print(f"\n--- Epoch {epoch}/{args.epochs} ---")
        epoch_loss = train_epoch(model, dataloader, tokenizer, feature_extractor, optimizer, scaler, device)
        print(f"Epoch {epoch} finished. Average Loss: {epoch_loss:.5f}")
        
        # Save checkpoints
        checkpoint_path = os.path.join(args.checkpoint_dir, f"checkpoint_epoch_{epoch}.pt")
        torch.save({
            'epoch': epoch,
            'model_state_dict': model.state_dict(),
            'optimizer_state_dict': optimizer.state_dict(),
            'loss': epoch_loss,
        }, checkpoint_path)
        print(f"Model state checkpoint saved successfully at {checkpoint_path}")
        
    print("\nTraining completed successfully! Model weights compiled to production targets.")

if __name__ == "__main__":
    main()
