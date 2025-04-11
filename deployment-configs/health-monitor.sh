#!/bin/bash
# health-monitor.sh
# Automated health monitoring and recovery script for Aetherion Wallet
# Recommended to run as a cron job every 5 minutes

# Terminal colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration 
SERVICES=("aetherion-0" "aetherion-1" "aetherion-2")  # Service names for multiple instances
DOMAIN="atc.aifreedomtrust.com"
ENDPOINTS=(
  "/dapp/health"             # Main app health check
  "/dapp/api/health"         # API health check
  "/health"                  # Nginx health check
)
RESPONSE_TIME_THRESHOLD=2000  # Maximum acceptable response time in ms
MAX_CPU_USAGE=85              # Maximum acceptable CPU usage percentage
MAX_MEMORY_USAGE=85           # Maximum acceptable memory usage percentage
DISK_SPACE_THRESHOLD=90       # Alert if disk space usage exceeds this percentage
CHECK_FREQ=300                # Check frequency in seconds (5 minutes)
NOTIFICATION_EMAIL="alerts@aifreedomtrust.com"
LOG_FILE="/var/log/aetherion/health-monitor.log"
MATRIX_ROOM_ID="${MATRIX_DEPLOYMENT_ROOM_ID}"
MATRIX_ACCESS_TOKEN="${MATRIX_ACCESS_TOKEN}"

# Create log directory if it doesn't exist
mkdir -p "$(dirname "$LOG_FILE")"

# Function to log messages
log() {
  echo -e "$(date +"%Y-%m-%d %H:%M:%S") - $1" | tee -a "$LOG_FILE"
}

# Function to send email notifications
send_email_alert() {
  local subject="$1"
  local message="$2"
  
  log "Sending email alert: $subject"
  echo -e "$message" | mail -s "Aetherion Health Alert: $subject" "$NOTIFICATION_EMAIL"
}

# Function to send Matrix notifications
send_matrix_alert() {
  local subject="$1"
  local message="$2"
  
  if [ -n "$MATRIX_ACCESS_TOKEN" ] && [ -n "$MATRIX_ROOM_ID" ]; then
    log "Sending Matrix alert: $subject"
    
    # Format the message for Matrix
    local formatted_message="<h4>🚨 Aetherion Health Alert</h4><p><strong>${subject}</strong></p><p>${message}</p><p>Timestamp: $(date +"%Y-%m-%d %H:%M:%S")</p>"
    
    # Send using curl
    curl -s -X PUT \
      -H "Authorization: Bearer $MATRIX_ACCESS_TOKEN" \
      -H "Content-Type: application/json" \
      -d "{\"msgtype\":\"m.room.message\",\"format\":\"org.matrix.custom.html\",\"body\":\"Aetherion Health Alert: ${subject}\",\"formatted_body\":\"${formatted_message}\"}" \
      "https://matrix.org/_matrix/client/r0/rooms/${MATRIX_ROOM_ID}/send/m.room.message/$(date +%s%N)" > /dev/null
  fi
}

# Function to restart a service
restart_service() {
  local service="$1"
  log "${YELLOW}Attempting to restart $service...${NC}"
  
  sudo systemctl restart "$service"
  
  # Check if restart was successful
  if sudo systemctl is-active --quiet "$service"; then
    log "${GREEN}Successfully restarted $service${NC}"
    send_matrix_alert "Service Restarted" "The service $service was unresponsive and has been automatically restarted."
    return 0
  else
    log "${RED}Failed to restart $service${NC}"
    send_matrix_alert "Service Restart Failed" "The service $service was unresponsive and could not be automatically restarted. Manual intervention required."
    send_email_alert "URGENT: Service Restart Failed" "The service $service was unresponsive and could not be automatically restarted. Manual intervention required."
    return 1
  fi
}

# Function to check system resource usage
check_system_resources() {
  log "${BLUE}Checking system resources...${NC}"
  
  # Check CPU usage
  local cpu_usage=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1}')
  cpu_usage=${cpu_usage%.*}  # Remove decimal part
  
  # Check memory usage
  local memory_usage=$(free | grep Mem | awk '{print $3/$2 * 100.0}')
  memory_usage=${memory_usage%.*}  # Remove decimal part
  
  # Check disk space
  local disk_usage=$(df -h / | grep -v Filesystem | awk '{print $5}' | sed 's/%//')
  
  log "CPU Usage: ${cpu_usage}%, Memory Usage: ${memory_usage}%, Disk Usage: ${disk_usage}%"
  
  # Check thresholds and alert if necessary
  if [ "$cpu_usage" -gt "$MAX_CPU_USAGE" ]; then
    log "${RED}CPU usage is too high: $cpu_usage% (threshold: $MAX_CPU_USAGE%)${NC}"
    send_matrix_alert "High CPU Usage" "CPU usage is at ${cpu_usage}% (threshold: ${MAX_CPU_USAGE}%)."
  fi
  
  if [ "$memory_usage" -gt "$MAX_MEMORY_USAGE" ]; then
    log "${RED}Memory usage is too high: $memory_usage% (threshold: $MAX_MEMORY_USAGE%)${NC}"
    send_matrix_alert "High Memory Usage" "Memory usage is at ${memory_usage}% (threshold: ${MAX_MEMORY_USAGE}%)."
  fi
  
  if [ "$disk_usage" -gt "$DISK_SPACE_THRESHOLD" ]; then
    log "${RED}Disk usage is too high: $disk_usage% (threshold: $DISK_SPACE_THRESHOLD%)${NC}"
    send_matrix_alert "Low Disk Space" "Disk usage is at ${disk_usage}% (threshold: ${DISK_SPACE_THRESHOLD}%)."
    send_email_alert "Low Disk Space Warning" "Disk usage is at ${disk_usage}% (threshold: ${DISK_SPACE_THRESHOLD}%). Please free up space to prevent service disruption."
  fi
}

# Function to check response time for an endpoint
check_response_time() {
  local url="$1"
  local time_total
  
  # Use curl to check response time
  time_total=$(curl -s -o /dev/null -w "%{time_total}" -k "https://${DOMAIN}${url}")
  
  # Convert to milliseconds
  local response_ms=$(echo "$time_total * 1000" | bc | cut -d. -f1)
  
  echo "$response_ms"
}

# Function to check service health
check_service_health() {
  local service="$1"
  
  log "${BLUE}Checking health of service: $service...${NC}"
  
  # Check if service is running
  if ! sudo systemctl is-active --quiet "$service"; then
    log "${RED}Service $service is not running!${NC}"
    restart_service "$service"
    return $?
  fi
  
  return 0
}

# Function to check endpoint health
check_endpoint_health() {
  local endpoint="$1"
  local full_url="https://${DOMAIN}${endpoint}"
  
  log "${BLUE}Checking endpoint: $full_url${NC}"
  
  # Check response status and time
  local http_status
  http_status=$(curl -s -o /dev/null -w "%{http_code}" -k "$full_url")
  
  if [ "$http_status" != "200" ]; then
    log "${RED}Endpoint $full_url returned HTTP status $http_status${NC}"
    return 1
  fi
  
  # Check response time
  local response_time
  response_time=$(check_response_time "$endpoint")
  
  log "Response time for $endpoint: ${response_time}ms"
  
  if [ "$response_time" -gt "$RESPONSE_TIME_THRESHOLD" ]; then
    log "${YELLOW}Response time for $endpoint is too high: ${response_time}ms (threshold: ${RESPONSE_TIME_THRESHOLD}ms)${NC}"
    send_matrix_alert "High Response Time" "Response time for $endpoint is ${response_time}ms (threshold: ${RESPONSE_TIME_THRESHOLD}ms)."
    return 2
  fi
  
  return 0
}

# Main monitoring function
main() {
  log "${BLUE}Starting Aetherion health monitoring check...${NC}"
  
  # Check system resources
  check_system_resources
  
  # Check each service
  for service in "${SERVICES[@]}"; do
    check_service_health "$service"
  done
  
  # Check each endpoint
  failed_endpoints=0
  for endpoint in "${ENDPOINTS[@]}"; do
    if ! check_endpoint_health "$endpoint"; then
      failed_endpoints=$((failed_endpoints + 1))
    fi
  done
  
  # Report status
  if [ "$failed_endpoints" -eq 0 ]; then
    log "${GREEN}All endpoints are healthy!${NC}"
  else
    log "${YELLOW}$failed_endpoints endpoint(s) have issues.${NC}"
    
    # If all endpoints are failing, restart the services
    if [ "$failed_endpoints" -eq "${#ENDPOINTS[@]}" ]; then
      log "${RED}All endpoints are failing. Attempting service recovery...${NC}"
      for service in "${SERVICES[@]}"; do
        restart_service "$service"
      fi
    fi
  fi
  
  log "${BLUE}Health monitoring check completed.${NC}"
  echo "----------------------------------------"
}

# Run the main function
main