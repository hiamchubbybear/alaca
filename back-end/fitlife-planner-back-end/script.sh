#docker-compose down -v --rmi all --remove-orphans
#docker-compose build --no-cache
#docker-compose up
dotnet ef migrations add RefactorProject1
dotnet ef migrations add CheckPendingChanges --dry-run                                                       
dotnet ef database update