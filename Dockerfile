
# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY . .

RUN dotnet restore "Takealot Assignment - Driver Related Code files.csproj"

RUN dotnet publish "Takealot Assignment - Driver Related Code files.csproj" \
    -c Release \
    -o /app/publish \
    -p:AssemblyName=DriverManagementSystem

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:10000

EXPOSE 10000

ENTRYPOINT ["dotnet", "DriverManagementSystem.dll"]
