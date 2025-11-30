
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY . .  

RUN dotnet restore ./fitlife-planner-back-end.csproj
RUN dotnet publish ./fitlife-planner-back-end.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://+:${PORT}

ENTRYPOINT ["dotnet", "fitlife-planner-back-end.dll"]
