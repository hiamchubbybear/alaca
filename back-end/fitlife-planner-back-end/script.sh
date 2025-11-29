#docker-compose down -v --rmi all --remove-orphans
#docker-compose build --no-cache
#docker-compose up
#dotnet ef migrations add ChangeProfileIdToUserIdPostV2
#dotnet ef migrations add CheckPendingChanges --dry-run                                                       
#dotnet ef database update
#
#dotnet ef migrations remove
#dotnet ef migrations add RenameTokenId
#dotnet ef database update

dotnet ef migrations add InitialCreate
dotnet ef database update
