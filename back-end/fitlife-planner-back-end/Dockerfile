FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8000

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["fitlife-planner-back-end.csproj", "./"]
RUN dotnet restore "./fitlife-planner-back-end.csproj"
COPY . .
RUN dotnet publish "./fitlife-planner-back-end.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "fitlife-planner-back-end.dll"]
