using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using GymForge.Domain.Interface;
using Microsoft.Extensions.Configuration;

namespace GymForge.Infrastructure.Services
{
    public class CloudinaryFileStorageService : IFileStorageService
    {
        private readonly Cloudinary _cloudinary;

        public CloudinaryFileStorageService(IConfiguration configuration)
        {
            string? cloudName = configuration["Cloudinary:CloudName"];
            string? apiKey = configuration["Cloudinary:ApiKey"];
            string? apiSecret = configuration["Cloudinary:ApiSecret"];

            if (string.IsNullOrEmpty(cloudName) || string.IsNullOrEmpty(apiKey) || string.IsNullOrEmpty(apiSecret))
            {
                throw new ArgumentException("Cloudinary configuration is missing.");
            }

            Account account = new Account(cloudName, apiKey, apiSecret);
            _cloudinary = new Cloudinary(account);
        }

        public async Task<string> SaveFileAsync(Stream fileStream, string fileName, string folder)
        {
            if (fileStream == null || fileStream.Length == 0)
                throw new ArgumentException("File stream is empty");

            ImageUploadParams uploadParams = new()
            {
                File = new FileDescription(fileName, fileStream),
                Folder = $"gymforge/{folder}",
                PublicId = $"{Guid.NewGuid()}_{Path.GetFileNameWithoutExtension(fileName)}"
            };

            ImageUploadResult uploadResult = await _cloudinary.UploadAsync(uploadParams);

            if (uploadResult.Error != null)
            {
                throw new Exception($"Cloudinary upload failed: {uploadResult.Error.Message}");
            }

            return uploadResult.SecureUrl.ToString();
        }

        public async Task DeleteFileAsync(string fileUrl)
        {
            if (string.IsNullOrEmpty(fileUrl)) return;

            Uri uri = new(fileUrl);
            string? path = uri.AbsolutePath;

            string[] segments = path.Split('/');
            int uploadIndex = Array.FindIndex(segments, s => s == "upload");
            
            if (uploadIndex == -1) return;

            List<string> relevantSegments = segments.Skip(uploadIndex + 2).ToList();
            string? publicIdWithExtension = string.Join("/", relevantSegments);
            string? publicId = Path.Combine(Path.GetDirectoryName(publicIdWithExtension) ?? "", 
                                        Path.GetFileNameWithoutExtension(publicIdWithExtension))
                                        .Replace("\\", "/");

            DeletionParams deletionParams = new(publicId);
            await _cloudinary.DestroyAsync(deletionParams);
        }
    }
}
