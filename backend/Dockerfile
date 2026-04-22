## ── Stage 1: build ───────────────────────────────────────────
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
COPY backend/.mvn/ .mvn/
COPY backend/mvnw backend/pom.xml ./
RUN ./mvnw dependency:go-offline -q
COPY backend/src ./src
RUN ./mvnw package -DskipTests -q

## ── Stage 2: runtime ─────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/quarkus-app/lib/ ./lib/
COPY --from=build /app/target/quarkus-app/*.jar ./
COPY --from=build /app/target/quarkus-app/app/ ./app/
COPY --from=build /app/target/quarkus-app/quarkus/ ./quarkus/

EXPOSE 8080
ENV JAVA_OPTS="-Dquarkus.http.host=0.0.0.0 -Djava.util.logging.manager=org.jboss.logmanager.LogManager"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar quarkus-run.jar"]
