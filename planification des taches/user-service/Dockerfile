# Build stage
FROM eclipse-temurin:17-jdk AS build

WORKDIR /app

COPY mvnw .
COPY mvnw.cmd .
COPY .mvn/ .mvn/
COPY pom.xml .

# Installer dos2unix et corriger les fins de ligne
RUN apt-get update && apt-get install -y dos2unix bash && \
    dos2unix mvnw && chmod +x mvnw

# Télécharger les dépendances
RUN ./mvnw dependency:go-offline -B

COPY src src

# Construire le JAR
RUN ./mvnw clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:17-jre

WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]